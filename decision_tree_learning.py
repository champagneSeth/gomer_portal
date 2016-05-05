''' Seth Champagne - 4.19.16 - CMPS 470
    | Decision Tree Learning Algorithm
    | Modified for GOMER Portal
    | Prints tree to stdout as JSON
'''
import sys

INPUT_FILE = sys.argv[1]


class Decision_Tree:
    ''' Decision Tree data structure
            Properties:
                root        --> name of node
                branches    --> dict of subtrees
                leaf        --> bool (if leaf node)
            Methods:
                add_branch  --> add branch entry with attr and subtree
    '''
    def __init__(self, root, leaf=False):
        self.root = root 
        self.branches = {}
        self.leaf = leaf

    def add_branch(self, attr, subtree):
        self.branches[attr] = subtree


    def __repr__(self):
        if self.leaf:
            return '"' + self.root + '"'
        ret = '{' + '"' + self.root + '":{'
        comma = False
        for attr, subtree in self.branches.items():
            if comma: ret += ','
            ret += '"' + attr + '":' + subtree.__repr__()
            comma = True
        return ret + '}}' 


    def json(self, level=1):
        if self.leaf:
            return '"' + self.root + '"\n'
        ret = '{\n' + '\t'*level + '"' + self.root + '" : {\n'
        comma = False
        for attr, subtree in self.branches.items():
            ret += '\t'*(level+1) 
            if comma: ret += ','
            ret += '"' + attr + '" : ' + subtree.json(level+2)
            comma = True
        return ret + '\n' + '\t'*(level-1) + '}}\n' 


def decision_tree_learning(examples, attributes, default):
    ''' Implements the Decision Tree Learning algorithm 
        by branching into four cases.
        Params:
            examples    --> list<dict<string, string>>
            attributes  --> dict<string, set<string>>
            default     --> string (goal predicate)
        Returns: Decision_Tree
    '''
    if not examples:
        return Decision_Tree(default, True)
    elif all_have_same_classification(examples):
        return Decision_Tree(get_goal(examples[0]), True)
    elif not attributes:
        return Decision_Tree(majority_classification(examples), True)
    else:
        return learn_a_node(examples, attributes)


def all_have_same_classification(examples):
    ''' Returns: True if all examples have the same goal predicate '''
    first_goal = get_goal(examples[0])
    return all(map(lambda ex: get_goal(ex) == first_goal, examples))


def get_goal(s):
    ''' Returns: the goal predicate of an example dict '''
    return s['GOAL']


def majority_classification(examples):
    ''' Determines which goal predicate appears the most in
        the list of examples '''
    values = [get_goal(ex) for ex in examples]
    majority = ('', 0)
    for goal in set(values):
        count = values.count(goal)
        if majority[1] < count:
            majority = (goal, count)
    return majority[0]


def learn_a_node(examples, attributes):
    '''
    '''
    best_attr = choose_best_attribute(examples, attributes)
    majority = majority_classification(examples)
    tree = Decision_Tree(best_attr)
    for value in attributes[best_attr]:
        remaining_examples   = reset_examples(best_attr, value, examples) 
        remaining_attributes = attributes.copy()
        remaining_attributes.pop(best_attr, 0)
        subtree = decision_tree_learning(remaining_examples, remaining_attributes, majority)
        tree.add_branch(value, subtree)
    return tree


def choose_best_attribute(examples, attributes):
    ''' Chooses the attribute that successfully 
        classifies the most examples
        Returns: name of the best attribute (defaults to first)
    '''
    best_attr = (attributes.items()[0], 0)
    positive, negative = divide_examples(examples)
    for name, values in attributes.items():
        num_classified = 0
        for value in values:
            num_pos = len(filter(lambda ex: ex[name] == value, positive))
            num_neg = len(filter(lambda ex: ex[name] == value, negative))
            if num_pos == 0 or num_neg == 0:
                num_classified += num_pos + num_neg
        if best_attr[1] < num_classified:
            best_attr = (name, num_classified)
    return best_attr[0]


def divide_examples(examples):
    ''' Divides the examples in positive and negative lists
        and returns both lists (checks for 'y' as goal predicate) '''
    positive = []
    negative = []
    for example in examples:
        if get_goal(example) == 'y':
            positive.append(example)
        else: negative.append(example)
    return (positive, negative)


def reset_examples(best, value, examples):
    ''' Returns: elements of examples with best == value '''
    return filter(lambda ex: ex[best] == value, examples)


def get_attributes_from_csv(attr_names, num_of_attributes, csv_lines):
    ''' Returns: dict<string, set> 
            --> attributes data structure '''
    attributes = {}
    for i in range(num_of_attributes):
        attributes[attr_names[i]] = set([ex[i] for ex in csv_lines])
    return attributes


def get_examples_from_csv(attr_names, num_of_attributes, csv_lines): 
    ''' Returns: list<dict<string, string>> 
            --> list of examples
            --> each example has attribute as the key
    '''
    examples = []
    for line in csv_lines:
        ex = {}
        for i in range(num_of_attributes):
            ex[attr_names[i]] = line[i]
        ex['GOAL'] = line[-1].strip()
        examples.append(ex)
    return examples


if __name__ == '__main__':
    reader = open(INPUT_FILE,  'r')

    input_lines = reader.readlines()

    attr_names = input_lines[0].split(',') 
    num_of_attributes = len(attr_names) - 1 
    
    # list of examples lines from csv file
    csv_lines = [line.split(',') for line in  input_lines[1:]]

    # get attributes and examples from the csv_lines
    attributes = get_attributes_from_csv(attr_names, num_of_attributes, csv_lines)
    examples   = get_examples_from_csv(attr_names, num_of_attributes, csv_lines)

    # learn the tree
    tree = decision_tree_learning(examples, attributes, get_goal(examples[0]))

    print(tree)
    reader.close()

